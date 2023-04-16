import torch
import torch.nn as nn
import torch.nn.functional as F

class BaseModel(nn.Module):
    def __init__(self, configs, env):
        super(BaseModel, self).__init__()

    def forward(self, inputs):
        raise NotImplementedError()

class DQN(BaseModel):
    def __init__(self, configs, env):
        super(DQN, self).__init__(configs, env)
        self.num_inputs = sum([v.shape[0] for v in env.observation_spec().values()])
        self.num_outputs = configs.num_choice_per_dim ** env.action_spec().shape[0]
        self.num_hidden = configs.num_hidden

        self.fc1 = nn.Linear(self.num_inputs, self.num_hidden)
        self.fc2 = nn.Linear(self.num_hidden, self.num_hidden)
        self.fc3 = nn.Linear(self.num_hidden, self.num_hidden)
        self.output = nn.Linear(self.num_hidden, self.num_outputs)

    def forward(self, inputs):
        x = F.relu(self.fc1(inputs.to(torch.float32)))
        x = F.relu(self.fc2(x))
        x = F.relu(self.fc3(x))
        return self.output(x)
