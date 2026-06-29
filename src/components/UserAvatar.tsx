import appIcon from "../assets/images/app_icon_probashi_1781952246301.jpg";

export default function UserAvatar({ 
  size = 40,
  photoUrl,
  name 
}: { 
  size?: number, 
  photoUrl?: string, 
  name?: string 
}) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          border: '2px solid rgba(255,255,255,0.3)'
        }}
        alt={name || 'User'}
      />
    );
  }
  
  // Show app logo if no photo
  return (
    <img
      src={appIcon}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        objectFit: 'cover',
        border: '2px solid rgba(255,255,255,0.3)'
      }}
      alt="প্রবাসী সেবা"
    />
  );
}
