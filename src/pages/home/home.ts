import {Component, OnInit, OnDestroy} from '@angular/core';

import {NavController} from 'ionic-angular';

import {ConfigService} from "../../services/config/config.service";
import {MQTTService} from "../../services/mqtt/mqtt.service";
import {Observable} from "rxjs";

import { Packet } from 'mqtt';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [MQTTService, ConfigService]
})

export class HomePage implements OnInit, OnDestroy {

  // Stream of messages
  public messages: Observable<Packet>;

  // A count of messages received
  public count = 0;

  constructor(public navCtrl: NavController, private _mqttClient: MQTTService, private _configService: ConfigService) {
  }

  ngOnInit() {
    // Get configuration from config service...
    this._configService.getConfig('assets/api/config.json').then(
      config => {
        // ... then pass it to (and connect) the message queue:
        this._mqttClient.configure(config);
        this._mqttClient.try_connect()
          .then(this.on_connect)
          .catch(this.on_error);
      }
    );
  }

  ngOnDestroy() {
    this._mqttClient.disconnect();
  }

  /** Callback on_connect to queue */
  public on_connect = () => {

    // Store local reference to Observable
    // for use with template ( | async )
    this.messages = this._mqttClient.messages;

    // Subscribe a function to be run on_next message
    this.messages.subscribe(this.on_next);
  };

  /** Consume a message from the _mqService */
  public on_next = (message: Packet) => {

    // Store message in "historic messages" queue
    console.log(message.toString() + '\n');

    // Count it
    this.count++;
  };

  public on_error = () => {
    console.error('Ooops, error in RawDataComponent');
  };

  sendMQTTMessage() {
    this._mqttClient.publish("Hai :3")
  }
}
