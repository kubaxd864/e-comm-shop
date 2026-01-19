export default function MessagesBox() {
  return (
    <div className="flex flex-col w-3/4 relative items-center gap-5 bg-bg-secondary rounded-2xl p-8">
      <ul
        id="messages"
        className="w-full flex flex-col mt-auto justify-center items-center gap-2 overflow-auto"
      ></ul>
      <form className="w-full">
        <div className="flex flex-row gap-5">
          <input
            placeholder="Wiadomość"
            className="w-full bg-bg-accent p-4 rounded"
            //   value={message}
            //   onChange={(e) => setMessage(e.target.value)}
          />
          <button
            type="submit"
            className="bg-primary py-3 px-6 rounded hover:bg-primary-hover"
          >
            Wyślij
          </button>
        </div>
      </form>
    </div>
  );
}
