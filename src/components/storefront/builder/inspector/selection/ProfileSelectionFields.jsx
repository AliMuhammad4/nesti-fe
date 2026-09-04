import { ImageAdjustmentControls, MediaPicker } from '../../builderUiPrimitives';

export default function ProfileSelectionFields({
  selectedField,
  media,
  brandKit,
  profile,
  onMediaUpload,
  onBrandKitChange,
}) {
  if (selectedField === 'brandKit.cover_url' || selectedField === 'brandKit.cover_photo_url') {
    return (
      <>
        <MediaPicker
          label="Page cover"
          image={media?.cover || brandKit?.cover_url}
          onUpload={(file) => onMediaUpload?.('cover', file)}
          tall
        />
        {(media?.cover || brandKit?.cover_url) ? (
          <ImageAdjustmentControls
            image={media?.cover || brandKit?.cover_url}
            kind="cover"
            values={brandKit}
            onChange={onBrandKitChange}
          />
        ) : null}
      </>
    );
  }
  if (selectedField === 'brandKit.profile_photo_url') {
    return (
      <MediaPicker
        label="Page profile"
        image={media?.profile || brandKit?.profile_photo_url}
        onUpload={(file) => onMediaUpload?.('profile', file)}
        circle
      />
    );
  }
  if (selectedField === 'brandKit.logo_url') {
    return (
      <MediaPicker
        label="Navbar logo"
        image={brandKit?.logo_url || profile?.storefront_logo_url}
        onUpload={(file) => onMediaUpload?.('logo', file)}
      />
    );
  }
  return (
    <p>Update this value from your profile or business settings. It will update every matching page element.</p>
  );
}
