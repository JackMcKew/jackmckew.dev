import argparse
import envs
import agents


def parse_args():
    parser = argparse.ArgumentParser()

    mode = parser.add_mutually_exclusive_group()
    mode.add_argument('--train', action='store_true')
    mode.add_argument('--eval', action='store_true')

    parser.add_argument('--domain', default='reacher')
    parser.add_argument('--task', default='easy')
    parser.add_argument('--model', default='DQN')

    parser.add_argument('--save_model', action='store_true')
    parser.add_argument('--verbose', action='store_true')
    parser.add_argument('--display', action='store_true')

    parser.add_argument('--save_training_curve', action='store_true')

    return parser.parse_args()


def main():
    args = parse_args()
    env = envs.create_env(args.domain, args.task, args.verbose)
    agent = agents.create_agent(args.model, env, args.verbose)

    if args.train:
        agent.train(env, args.save_model, args.verbose, args.display, args.save_training_curve)
    elif args.eval:
        agent.eval(env, args.verbose, args.display)


if __name__ == '__main__':
    main()
