require "cconfig"
json = require "json"
function connect()
    return http.websocketAsync(remote, { Authorization = token })
end

connect()
local timer = os.startTimer(2)

local websocket = nil

function handleMessage(data)
    index = string.find(data, "\n")
    local commentIndex = string.find(data, "-- ")
    local newLineIndex = string.find(data, "\n")
    if commentIndex == nil or newLineIndex == nil then
        websocket.send("{\"error\": \"malformed task\"}")
    end
    local taskID = string.sub(data, commentIndex + 3, newLineIndex - 1)
    local task = loadstring(data)
    pcall(function() runTask(task, taskID) end)
end

function runTask(task, taskID)
    local payload = { id = taskID, payload = task()}
    local response = json.encode(payload)
    websocket.send(response)
end

while true do
    local eventData = {os.pullEvent()}
    local event = eventData[1]

    if event == "websocket_success" then
        websocket = eventData[3]
    end

    if event == "websocket_closed" then
        connect()
    end

    if event == "websocket_failure" then
        connect()
    end

    if event == "websocket_message" then
        handleMessage(eventData[3])
    end
end