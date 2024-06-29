/* eslint-disable quotes */
/* eslint-disable prettier/prettier */
import { makeAutoObservable } from "mobx";
import { Platform, AppState } from "react-native";
import {
  check,
  request,
  openSettings,
  PermissionStatus,
  PERMISSIONS,
} from "react-native-permissions";

type PermissionKey = 'cameraPermission' | 'notificationPermission';

class PermissionStore {
  cameraPermission: PermissionStatus = 'unavailable';
  notificationPermission: PermissionStatus = 'unavailable';

  constructor() {
    makeAutoObservable(this);
    this.checkPermissions();

    AppState.addEventListener('change', this.handleAppStateChange);
  }

  async checkPermissions() {
    const camera = await check(
      Platform.OS === 'android' ? PERMISSIONS.ANDROID.CAMERA : PERMISSIONS.IOS.CAMERA
    );
    const notifications = await check(
      Platform.OS === 'android'
        ? PERMISSIONS.ANDROID.RECEIVE_WAP_PUSH
        : PERMISSIONS.IOS.BLUETOOTH
    );

    this.cameraPermission = camera;
    this.notificationPermission = notifications;
  }

  async requestPermission(permission: 'camera' | 'notification') {
    const permissionType =
      permission === 'camera'
        ? PERMISSIONS.ANDROID.CAMERA
        : PERMISSIONS.ANDROID.RECEIVE_WAP_PUSH;

    const result = await request(permissionType);

    if (result === 'blocked') {
      this.openAppSettings();
    } else {
      this.checkPermissions();
    }
  }

  openAppSettings() {
    openSettings().catch(() => console.warn('Cannot open settings'));
  }

  togglePermission(permission: 'camera' | 'notification') {
    const permissionKey: PermissionKey = `${permission}Permission`;

    if (this[permissionKey] === 'granted') {
      this.openAppSettings();
    } else {
      this.requestPermission(permission);
    }
  }

  handleAppStateChange = (nextAppState: string) => {
    if (nextAppState === 'active') {
      this.checkPermissions();
    }
  };
}

export const permissionStore = new PermissionStore();