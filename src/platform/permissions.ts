export interface PermissionPolicy {
  camera: 'not-requested';
  photos: 'not-requested';
  location: 'not-requested';
  tracking: 'not-requested';
}

export const permissionPolicy: PermissionPolicy = Object.freeze({
  camera: 'not-requested',
  photos: 'not-requested',
  location: 'not-requested',
  tracking: 'not-requested',
});

export function hasNoRuntimePermissionRequirements(): boolean {
  return Object.values(permissionPolicy).every(value => value === 'not-requested');
}
