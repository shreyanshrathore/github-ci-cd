import { IMessageBrokerService } from "./IMessageBrokerService";
import * as amqplib from "amqplib";
export class RabbitMQService implements IMessageBrokerService {
  private connection: amqplib.Connection | null = null;
  private channel: amqplib.Channel | null = null;

  private EXCHANGE_TYPE = {
    DIRECT: "direct",
    TOPIC: "topic",
    HEADERS: "headers",
    FANOUT: "fanout",
    MATCH: "match",
  };

  async connect(): Promise<void> {
    try {
      if (!this.connection) {
        this.connection = await amqplib.connect(process.env.MSG_QUEUE_URL!);
        this.channel = await this.connection.createChannel();
        console.log("RabbitMQ Channel and Connection created!");
      }
    } catch (error: any) {
      throw new Error(`Failed to connect to RabbitMQ: ${error}`);
    }
  }

  async setupInitial(): Promise<void> {
    try {
      await this.connect();
      await this.setupExchanges();
      await this.setupQueues();
      await this.setupBindings();
    } catch (error: any) {
      throw new Error(`Failed to set up RabbitMQ: ${error}`);
    }
  }

  private async setupExchanges(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.assertExchange(
          process.env.MSG_EXCHANGE_NAME!,
          this.EXCHANGE_TYPE.DIRECT,
          { durable: true }
        );
      }
    } catch (error: any) {
      throw new Error(`Failed to set up exchanges: ${error}`);
    }
  }

  private async setupQueues(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.assertQueue(process.env.MSG_PUB_QUEUE_NAME!, {
          durable: true,
        });
      }
    } catch (error: any) {
      throw new Error(`Failed to set up queues: ${error}`);
    }
  }

  private async setupBindings(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.bindQueue(
          process.env.MSG_PUB_QUEUE_NAME!,
          process.env.MSG_EXCHANGE_NAME!,
          process.env.MSG_BINDING_KEY!
        );

        // await this.channel.bindQueue(
        //   process.env.QUEUE_NAME!,
        //   process.env.EXCHANGE_NAME!,
        //   process.env.PRODUCT_WISHLIST_PUBLISH_BINDING_KEY!
        // );
      }
    } catch (error: any) {
      throw new Error(`Failed to set up bindings: ${error}`);
    }
  }

  async publish(
    exchange: string,
    routingKey: string,
    message: string
  ): Promise<void> {
    try {
      await this.connect();
      if (this.channel) {
        await this.channel.assertExchange(exchange, this.EXCHANGE_TYPE.DIRECT);
        this.channel.publish(exchange, routingKey, Buffer.from(message));
        console.log("Message sent: ", message);
      }
    } catch (error: any) {
      throw new Error(`Failed to publish message: ${error}`);
    }
  }

  async consume(queue: string, callback: (msg: any) => void): Promise<void> {
    try {
      await this.connect();
      if (this.channel) {
        await this.channel.assertQueue(queue);
        this.channel.consume(queue, (msg) => {
          if (msg) {
            callback(msg.content.toString());
            this.channel!.ack(msg);
            console.log("Message received: ", msg.content.toString());
          }
        });
      }
    } catch (error: any) {
      throw new Error(`Failed to consume messages: ${error}`);
    }
  }

  async closeConnection(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
    } catch (error: any) {
      throw new Error(
        `Failed to close RabbitMQ connection or channel: ${error}`
      );
    }
  }

  getChannel(): amqplib.Channel | null {
    return this.channel;
  }
}
