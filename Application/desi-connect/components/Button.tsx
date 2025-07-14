import { StyleSheet, View, Pressable, Text } from 'react-native';

type Props = {
  label: string;
  handlePressed: () => void;
  variant?: 'primary' | 'outline';
};

export default function Button({ label, handlePressed, variant = 'primary' }: Props) {
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      onPress={handlePressed}
      style={[
        styles.buttonBase,
        isPrimary ? styles.primaryButton : styles.outlineButton,
      ]}
    >
      <Text style={isPrimary ? styles.primaryText : styles.outlineText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buttonBase: {
    width: '85%',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  primaryButton: {
    backgroundColor: '#4B0082', // deep purple
  },
  outlineButton: {
    borderWidth: 1.5,
    borderColor: '#4B0082',
    backgroundColor: 'transparent',
  },
  primaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  outlineText: {
    color: '#4B0082',
    fontSize: 16,
    fontWeight: '600',
  },
});
