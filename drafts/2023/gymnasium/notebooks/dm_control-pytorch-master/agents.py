import torch
import torch.optim as optim
import torch.nn.functional as F
import numpy as np
import collections
import os.path
import models
import utils

Transition = collections.namedtuple('Transition',
                                    ['state', 'action', 'next_state', 'reward'])

class BaseAgent:
    def __init__(self, model_name, env):
        super(BaseAgent, self).__init__()
        self.model_name = model_name
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.configs = utils.load_yaml_configs('model_configs.yaml', self.model_name)

    def train(self, env, verbose=False):
        raise NotImplementedError()

    def eval(self, env, verbose=False):
        raise NotImplementedError()

    def save_model(self):
        pass

    def load_model(self):
        pass


class DQNAgent(BaseAgent):
    def __init__(self, model_name, env):
        super(DQNAgent, self).__init__(model_name, env)
        self.episode = self.configs.episode
        self.batch_size = self.configs.batch_size
        self.gamma = self.configs.gamma
        self.eps_start = self.configs.eps_start
        self.eps_end = self.configs.eps_end
        self.eps_decay = self.configs.eps_decay
        self.target_update_episode = self.configs.target_update_episode

        self.model_path = self.configs.save_path
        self.save_episode = self.configs.save_episode
        self.plot_episode = self.configs.plot_episode

        self.policy_net = models.DQN(self.configs, env).to(self.device)
        self.target_net = models.DQN(self.configs, env).to(self.device)
        self.load_model(self.model_path)
        self.optimizer = optim.Adam(self.policy_net.parameters(),
                                    lr=self.configs.optimizer_lr,
                                    betas=(self.configs.optimizer_beta1, self.configs.optimizer_beta2),
                                    eps=self.configs.optimizer_eps,
                                    weight_decay=self.configs.optimizer_weight_decay
        )
        self.memory = utils.ReplayMemory(10000)
        self.num_random_choose = 0

        self.num_choice_per_dim = self.configs.num_choice_per_dim
        self.action_dim = env.action_spec().shape
        self.action_min = env.action_spec().minimum
        self.action_max = env.action_spec().maximum

        self.action_space = utils.enumerate(self.num_choice_per_dim, self.action_min, self.action_max)


    def select_action(self, state, random_choose=False):
        if random_choose:
            eps_threshold = self.eps_start + (self.eps_end - self.eps_start) * min(self.num_random_choose / self.eps_decay, 1.)
            self.num_random_choose += 1
            if np.random.uniform() < eps_threshold:
                return np.random.randint(len(self.action_space))

        with torch.no_grad():
            return self.policy_net(state).argmax().item()


    def _update_memory(self, transition):
        self.memory.push(transition)


    def _update_model(self):
        if len(self.memory) < self.batch_size:
            return
        transitions = self.memory.sample(self.batch_size)
        batch = Transition(*zip(*transitions))

        state_batch = torch.cat(batch.state)
        action_batch = torch.cat(batch.action)
        reward_batch = torch.cat(batch.reward)

        cur_q_values = self.policy_net(state_batch).gather(1, action_batch)

        non_final_mask = torch.tensor(tuple(map(lambda s: s is not None, batch.next_state)), device=self.device, dtype=torch.uint8)
        non_final_next_state = torch.cat([s for s in batch.next_state if s is not None])
        next_q_values = torch.zeros(self.batch_size, device=self.device)
        next_q_values[non_final_mask] = self.target_net(non_final_next_state).max(dim=1)[0].detach()

        expected_q_values = (next_q_values * self.gamma) + reward_batch

        loss = F.smooth_l1_loss(cur_q_values, expected_q_values.unsqueeze(1))

        self.optimizer.zero_grad()
        loss.backward()
        torch.nn.utils.clip_grad_value_(self.target_net.parameters(), 1.0)
        self.optimizer.step()

    def train(self, env, save_model=False, verbose=False, display=True, save_training_curve=False):
        if verbose:
            print('Start training.')

        rewards = []
        recent_rewards = []
        for i_episode in range(self.episode):
            reward = []
            time_step = env.reset()
            cur_state = torch.tensor([utils.get_state(time_step.observation)], device=self.device)
            while not time_step.last():
                action_ID = self.select_action(cur_state, random_choose=True)
                time_step = env.step(self.action_space[action_ID])
                reward.append(time_step.reward)
                next_state = torch.tensor([utils.get_state(time_step.observation)], device=self.device)

                self.memory.push(Transition(state=cur_state, 
                                            action=torch.tensor([[action_ID]], device=self.device, dtype=torch.long),
                                            next_state=next_state, 
                                            reward=torch.tensor([time_step.reward], device=self.device)
                                            )
                                 )

                cur_state = next_state

                self._update_model()

            reward = np.mean(reward)
            recent_rewards.append(reward)

            if verbose:
                print('Episode {} average reward: {}'.format(i_episode, reward))

            if i_episode % self.target_update_episode == 0:
                self.target_net.load_state_dict(self.policy_net.state_dict())

            if i_episode % self.save_episode == 0:
                self.save_model(self.model_path)

            if i_episode % self.plot_episode == 0:
                rewards.append(np.mean(recent_rewards))
                recent_rewards = []
                if save_training_curve:
                    utils.plot_figure(y=rewards,
                                      x=list(range(0, i_episode + 1, self.save_episode)),
                                      title='Training Curve',
                                      xlabel='Episode',
                                      ylabel='Reward',
                                      figure_num=0,
                                      display=display,
                                      save=save_training_curve,
                                      filename='DQN_training_curve.png'
                                      )
        
        if verbose:
            print('End training.')


    def eval(self, env, verbose=False, display=False):
        if verbose:
            print('Start evaluation.')

        rewards = []
        for i_episode in range(self.episode):
            reward = []
            time_step = env.reset()
            state = torch.tensor([utils.get_state(time_step.observation)], device=self.device)
            while not time_step.last():
                action_ID = self.select_action(state, random_choose=False)
                time_step = env.step(self.action_space[action_ID])
                reward.append(time_step.reward)
                state = torch.tensor([utils.get_state(time_step.observation)], device=self.device)

            reward = np.mean(reward)
            rewards.append(reward)

            if verbose:
                print('Episode {} average reward: {}'.format(i_episode, reward))

        if verbose:
            print('End evaluation.')

        print('Average reward: {}'.format(np.mean(rewards)))


    def save_model(self, filename='DQN_model'):
        torch.save(self.target_net.state_dict(), filename)


    def load_model(self, filename='DQN_model'):
        if os.path.isfile(filename):
            self.target_net.load_state_dict(torch.load(filename))
        self.policy_net.load_state_dict(self.target_net.state_dict())


def create_agent(model_name, env, verbose=False):
    assert model_name in ['DQN'], 'Cannot find model {}.'.format(model_name)

    if verbose:
        print('Creating Model.')

    if model_name == 'DQN':
        return DQNAgent(model_name, env)
