export interface IMessageBrokerService {
  connect(): Promise<void>; // Ensures connection is established
  setupInitial(): Promise<void>; // Sets up exchanges, queues, and bindings
  publish(exchange: string, routingKey: string, message: string): Promise<void>;
  consume(queue: string, callback: (msg: any) => void): Promise<void>;
  closeConnection(): Promise<void>;
  getChannel(): any | null;
}
