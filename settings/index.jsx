import * as helper from "./helper";

function ChessSettings(props) {
  return (
    <Page>
      <Section
        title={<Text bold align="center">Chess AI Settings</Text>}>
       
        <Slider
          label="AI level"
          settingsKey="ai_level"
          min="1"
          max="3"
        />
        <Text>Level: {props.settingsStorage.getItem('ai_level')}</Text>

        <Toggle
          settingsKey="toggle"
          label="Color"
          settingsKey="ai_color"
        />
        <Text>Color: {(props.settingsStorage.getItem('ai_color') == "true") ? "White" : "Black"}</Text>
        
        <TextInput
          label="FEN:"
          settingsKey="fen_str"
        />
        <Button
          label="Load FEN"
          onClick={() => props.settingsStorage.setItem('load_fen', 'ok')}
        />
        
      </Section>
    </Page>
  );
}

registerSettingsPage(ChessSettings);