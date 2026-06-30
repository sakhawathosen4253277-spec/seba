import appIcon from "../assets/images/app_icon_probashi_1781952246301.jpg";

export default function UserAvatar({ 
  size = 40,
  photoUrl,
  name,
  isPremium = false
}: { 
  size?: number, 
  photoUrl?: string, 
  name?: string,
  isPremium?: boolean
}) {
  const imageSrc = photoUrl || appIcon;

  if (isPremium) {
    return (
      <div 
        style={{
          width: size,
          height: size,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Style Tag for self-contained golden animation */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes goldenSparkleRot {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}} />

        {/* Animated outer golden gradient ring */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            padding: '2px',
            background: 'linear-gradient(135deg, #FFD700, #FFF9D0, #FFA500, #FFF, #FF8C00)',
            animation: 'goldenSparkleRot 4s linear infinite',
            zIndex: 1,
            boxShadow: '0 0 6px rgba(255, 215, 0, 0.6)'
          }}
        />

        {/* Inner Container to hold the photo securely with high quality */}
        <div
          style={{
            position: 'absolute',
            top: '2px',
            left: '2px',
            right: '2px',
            bottom: '2px',
            borderRadius: '50%',
            overflow: 'hidden',
            backgroundColor: '#1B4F72',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={imageSrc}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            alt={name || 'User'}
          />
        </div>

        {/* Subtle premium gold badge indicator */}
        <div
          style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            borderRadius: '50%',
            width: '15px',
            height: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            zIndex: 3,
            border: '1px solid #FFFFFF'
          }}
          title="Premium Member"
        >
          <span style={{ fontSize: '9px', color: '#1B4F72', fontWeight: 'bold', lineHeight: 1 }}>★</span>
        </div>
      </div>
    );
  }

  // Standard non-premium layout
  return (
    <img
      src={imageSrc}
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
