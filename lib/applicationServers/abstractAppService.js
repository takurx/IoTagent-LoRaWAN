/*
 * Copyright 2019 Atos Spain S.A
 *
 * This file is part of iotagent-lora
 *
 * iotagent-lora is free software: you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * iotagent-lora is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with iotagent-lora.
 * If not, seehttp://www.gnu.org/licenses/.
 *
 */

/* eslint-disable no-unused-vars */
/* eslint-disable no-prototype-builtins */

const config = require('../configService');
const _ = require('lodash');
const context = {
	op: 'IoTAgentLoRaWAN.AbstractAppService'
};

/**
 *Class that represents a LoRaWAN app server
 */
class AbstractAppService {
	/**
	 * Constructs the object.
	 *
	 * @param      {String}  applicationServer  The application server
	 * @param      {String}  appEui             The application eui
	 * @param      {String}  applicationId      The application identifier
	 * @param      {String}  applicationKey     The application key
	 * @param      {Function}  messageHandler     The message handler
	 * @param      {String}  dataModel     The data model
	 * @param      {Object}  iotaConfiguration     The IOTA configuration associated to this Application Server.
	 */
	constructor(
		applicationServer,
		appEui,
		applicationId,
		applicationKey,
		messageHandler,
		dataModel,
		iotaConfiguration
	) {
		if (this.constructor === AbstractAppService) {
			throw new TypeError('Abstract class "AbstractAppService" cannot be instantiated directly.');
		}

		if (!applicationServer) {
			throw new Error('Invalid arguments: Missing applicationServer');
		}

		if (!appEui) {
			throw new Error('Invalid arguments: Missing appEui');
		}

		if (!messageHandler) {
			throw new Error('Invalid arguments: Missing messageHandler');
		}

		if (!applicationServer.host) {
			throw new Error('Invalid arguments: Missing host');
		}

		this.applicationServer = applicationServer;
		this.appEui = appEui;
		this.applicationId = applicationId;
		this.applicationKey = applicationKey;
		this.messageHandler = messageHandler;
		this.devices = {};
		this.iotaConfiguration = iotaConfiguration;
		this.dataModel = dataModel;
	}

	/**
	 * It starts the TTN Application Service interface. Abstract method
	 *
	 * @param      {Function}  callback  The callback
	 */
	start(callback) {
		throw new Error('Abstract method.');
	}

	/**
	 * It stops the TTN Application Service interface. Abstract method
	 *
	 * @param      {Function}  callback  The callback
	 */
	stop(callback) {
		throw new Error('Abstract method.');
	}

	/**
	 * It observes a new device. Abstract method
	 *
	 * @param      {string}  devId         The development identifier
	 * @param      {String}  devEUI         The development identifier
	 * @param      {<type>}  deviceObject  The device object
	 */
	observeDevice(devId, devEUI, deviceObject) {
		throw new Error('Abstract method.');
	}

	/**
	 * It stops observing a device. Abstract method
	 *
	 * @param      {string}  devId         The development identifier
	 * @param      {String}  devEUI         The development identifier
	 * @param      {<type>}  deviceObject  The device object
	 */
	stopObservingDevice(devId, devEUI, deviceObject) {
		throw new Error('Abstract method.');
	}

	/**
	 * It observes all devices. Abstract method
	 */
	observeAllDevices() {
		throw new Error('Abstract method.');
	}

	/**
	 * It stops observeing all devices. Abstract method
	 */
	stopObserveAllDevices() {
		throw new Error('Abstract method.');
	}

	/**
	 * Gets the application identifier.
	 *
	 * @return     {String}  The application identifier.
	 */
	getAppId() {
		return this.appEui;
	}

	/**
	 * Gets the application server configuration.
	 *
	 * @return     {Object}  The application server configuration.
	 */
	getAppServerConf() {
		return {
			lorawan: {
				app_eui: this.appEui,
				application_server: this.applicationServer,
				application_id: this.applicationId,
				application_key: this.applicationKey,
				data_model: this.dataModel
			}
		};
	}

	/**
	 * Gets the application server configuration.
	 *
	 * @return     {Object}  The application server configuration.
	 */
	setAppServerConf(applicationServer, applicationId, applicationKey, dataModel) {
		this.applicationServer = applicationServer;
		this.applicationId = applicationId;
		this.applicationKey = applicationKey;
		this.dataModel = dataModel;
	}

	/**
	 * Gets the iota configuration.
	 *
	 * @return     {Object}  The iota confoguration.
	 */
	getIotaConfiguration() {
		return this.iotaConfiguration;
	}

	/**
	 * Set the iota configuration.
	 *
	 * @param      {Object}  iotaConfiguration     The IOTA configuration associated to this Application Server.
	 */
	setIotaConfiguration(iotaConfiguration) {
		this.iotaConfiguration = iotaConfiguration;
	}

	/**
	 * Adds a device.
	 *
	 * @param      {String}  devId         The development identifier
	 * @param      {String}  devEUI         The development identifier
	 * @param      {Object}  deviceObject  The device object
	 */
	addDevice(devId, devEUI, deviceObject) {
		if (this.devices && this.devices[devId] && _.isEqual(this.devices[devId], deviceObject)) {
			config.getLogger().info(context, 'Device already provisioned');
		} else {
			this.observeDevice(devId, devEUI, deviceObject);
			this.devices[devId] = deviceObject;
		}
	}

	/**
	 * Removes a device.
	 *
	 * @param      {String}  devId         The development identifier
	 * @param      {String}  devEUI         The development identifier
	 * @param      {Object}  deviceObject  The device object
	 */
	removeDevice(devId, devEUI, deviceObject) {
		this.stopObservingDevice(devId, devEUI, deviceObject);
		delete this.devices[devId];
	}

	/**
	 * Gets the device.
	 *
	 * @param      {String}  devId   The device identifier
	 * @return     {Object}  The device.
	 */
	getDevice(devId) {
		if (this.devices) {
			return this.devices[devId];
		}
		return null;
	}

	/**
	 * Get data model for the device
	 * @param  {String} devId Device's ID
	 * @param  {String} devEui Device's EUI
	 */
	getDataModel(devId, devEui) {
		let device = {};
		let dataModel = {};
		if (!devId && !devEui) {
			config.getLogger().error(context, 'Device ID or device EUI must be provided');
			throw new Error('Device ID or device EUI must be provided');
		} else if (devId) {
			device = this.getDevice(devId);
		} else {
			device = this.getDeviceByEui(devEui);
		}

		if (device && device.internalAttributes && device.internalAttributes.lorawan) {
			dataModel = device.internalAttributes.lorawan.data_model;
		} else {
			dataModel = this.dataModel;
		}

		return dataModel;
	}

	/**
	 * Gets the device by the EUI
	 *
	 * @param      {String}  devEui   The device EUI
	 * @return     {Object}  The device.
	 */
	getDeviceByEui(devEui) {
		if (this.devices) {
			for (const deviceKey in this.devices) {
				if (this.devices.hasOwnProperty(deviceKey)) {
					const device = this.devices[deviceKey];
					let lorawanConf;
					if (device.internalAttributes instanceof Array) {
						for (let i = 0; i < device.internalAttributes.length; i++) {
							if (device.internalAttributes[i].lorawan) {
								lorawanConf = device.internalAttributes[i];
								break;
							}
						}
					} else {
						lorawanConf = device.internalAttributes;
					}

					if (lorawanConf && lorawanConf.lorawan.dev_eui.toLowerCase() === devEui.toLowerCase()) {
						return device;
					}
				}
			}
		}

		return null;
	}
}

exports.AbstractAppService = AbstractAppService;
