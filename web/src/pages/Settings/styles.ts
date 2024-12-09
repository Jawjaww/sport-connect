import { Theme } from '@mui/material/styles';
import { SxProps } from '@mui/system';

interface Styles {
  root: SxProps<Theme>;
  section: SxProps<Theme>;
  label: SxProps<Theme>;
  formControl: SxProps<Theme>;
  button: SxProps<Theme>;
  avatar: SxProps<Theme>;
  avatarWrapper: SxProps<Theme>;
  avatarButton: SxProps<Theme>;
  hiddenInput: SxProps<Theme>;
  uploadIconButton: SxProps<Theme>;
  dialogContent: SxProps<Theme>;
}

const styles: Styles = {
  root: {
    padding: 3,
    maxWidth: 'lg',
  },
  section: {
    marginBottom: 4,
  },
  label: {
    marginBottom: 2,
    color: 'text.secondary',
    fontSize: '1rem',
    fontWeight: 500,
  },
  formControl: {
    marginBottom: 2,
    width: '100%',
  },
  button: {
    marginTop: 2,
  },
  avatar: {
    width: 80,
    height: 80,
  },
  avatarWrapper: {
    position: 'relative',
    display: 'inline-block',
  },
  avatarButton: {
    marginTop: 1,
  },
  hiddenInput: {
    display: 'none',
  },
  uploadIconButton: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    backgroundColor: 'background.paper',
  },
  dialogContent: {
    paddingTop: 2,
    paddingBottom: 2,
  },
};

export { styles };
export default styles;
