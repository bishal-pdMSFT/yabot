import { Activity, CardFactory, MessageFactory, TurnContext } from "botbuilder";
import { CommandMessage, MessageBuilder, TeamsFxBotCommandHandler, TriggerPatterns } from "@microsoft/teamsfx";
import { AdaptiveCards } from "@microsoft/adaptivecards-tools";
import sparklesCard from "./adaptiveCards/sparklesCard.json";
import { CardData } from "./cardModels";
import * as OS from 'os';

/**
 * The `SparkleCommandHandler
 * ` registers a pattern with the `TeamsFxBotCommandHandler` and responds
 * with an Adaptive Card if the user types the `triggerPatterns`.
 */
export class SparkleCommandHandler
 implements TeamsFxBotCommandHandler {
  triggerPatterns: TriggerPatterns = "sparkle";
  leaderboard = new Map<string, number>();

  async handleCommandReceived(
    context: TurnContext,
    message: CommandMessage
  ): Promise<string | Partial<Activity> | void> {
    console.log(`App received message: ${message.text}`);

    let mentions = context.activity.entities.filter(e => !!e.mentioned);
    let uniqueMentions: Map<string, string> = new Map<string, string>();
    //let mentionNames = []
    mentions.forEach(e => {
      if(e.mentioned.id.includes(process.env.BOT_ID ?? null)) return;
      if(!uniqueMentions.has(e.mentioned.id)) {
        uniqueMentions.set(e.mentioned.id, e.mentioned.name);
      } else {
        uniqueMentions.set(e.mentioned.id, uniqueMentions.get(e.mentioned.id).concat(` ${e.mentioned.name}`));
      }
    });

    let sparkleMessages = [];
    uniqueMentions.forEach((name: string, id:string) => {
      if(this.leaderboard.has(id)) {
        let value = this.leaderboard.get(id);
        this.leaderboard.set(id, ++value);
        sparkleMessages = sparkleMessages.concat(`Aww yiss! **${name}** has **${value}** sparkles`)//.concat(OS.EOL);
      } else {
        this.leaderboard.set(id, 1);
        sparkleMessages = sparkleMessages.concat(`Aww yiss! **${name}** has gotten **first** sparkle`)//.concat(OS.EOL);
      }
    })

    // mentionNames.forEach(name => message.text.replace(name, ''));
    // message.text.replace(<string>this.triggerPatterns, '')
    // message.text.trim();
    

    // Render your adaptive card for reply message
    const cardData: CardData = {
      body: `- ${sparkleMessages.join(' \r- ')}`,
    };

    const cardJson = AdaptiveCards.declare(sparklesCard).render(cardData);
    return MessageFactory.attachment(CardFactory.adaptiveCard(cardJson));
  }
}
