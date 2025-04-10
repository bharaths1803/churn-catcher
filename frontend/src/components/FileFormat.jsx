const FileFormat = ({ setShowModal }) => {
  return (
    <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-[90%] max-w-2xl shadow-lg">
        <h2 className="text-xl font-bold mb-4">CSV Format Guide</h2>
        <ul className="space-y-2 text-sm">
          <li>
            <strong>user id</strong>: A unique id for user
          </li>
          <li>
            <strong>state</strong>: 2-letter abbreviation of the customer's
            state
          </li>
          <li>
            <strong>account length</strong>: Number of days the account has been
            active
          </li>
          <li>
            <strong>area code</strong>: Customer’s area code (e.g., 415, 408)
          </li>
          <li>
            <strong>phone number</strong>: Customer's number in format XXX-XXXX
          </li>
          <li>
            <strong>international plan</strong>: yes / no
          </li>
          <li>
            <strong>voice mail plan</strong>: yes / no
          </li>
          <li>
            <strong>number vmail messages</strong>: Number of voicemail messages
          </li>
          <li>
            <strong>total day minutes</strong>: Total daytime usage (minutes)
          </li>
          <li>
            <strong>total day calls</strong>: Number of daytime calls
          </li>
          <li>
            <strong>total day charge</strong>: Daytime charges in USD
          </li>
          <li>
            <strong>total eve minutes</strong>: Evening usage (minutes)
          </li>
          <li>
            <strong>total eve calls</strong>: Number of evening calls
          </li>
          <li>
            <strong>total eve charge</strong>: Evening charges in USD
          </li>
          <li>
            <strong>total night minutes</strong>: Night usage (minutes)
          </li>
          <li>
            <strong>total night calls</strong>: Number of night calls
          </li>
          <li>
            <strong>total night charge</strong>: Night charges in USD
          </li>
          <li>
            <strong>total intl minutes</strong>: International call minutes
          </li>
          <li>
            <strong>total intl calls</strong>: Number of international calls
          </li>
          <li>
            <strong>total intl charge</strong>: International call charges
          </li>
          <li>
            <strong>customer service calls</strong>: Number of customer service
            interactions
          </li>
        </ul>
        <button
          className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          onClick={() => setShowModal(false)}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default FileFormat;
