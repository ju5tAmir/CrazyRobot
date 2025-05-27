using System;
using Api.WebSocket.ClientDto.robot;
using Api.Websocket.EventHandlers.Robot.BatteryLevel;
using Application.Interfaces.Infrastructure.Websocket;
using Application.Models.Dtos.robot;
using Application.Services;
using Microsoft.Extensions.Options;
using Moq;
using NUnit.Framework;

namespace Startup.Tests.EventTests
{
    [TestFixture]
    public class BatteryLevelNotifierTests
    {
        private Mock<IConnectionManager> _connManagerMock;
        private Mock<IOptionsMonitor<MqttOptions>> _optionsMonitorMock;
        private BatteryLevelNotifier _notifier;

        [SetUp]
        public void SetUp()
        {
            // 1) We mock IConnectionManager
            _connManagerMock = new Mock<IConnectionManager>();

            // 2) Prepare MqttOptions with our topic
            var mqttOpts = new MqttOptions
            {
                BatteryLevelInfo = "battery-topic"
            };
            _optionsMonitorMock = new Mock<IOptionsMonitor<MqttOptions>>();
            _optionsMonitorMock
                .Setup(x => x.CurrentValue)
                .Returns(mqttOpts);

            // 3) Instantiate the tested class
            _notifier = new BatteryLevelNotifier(
                _connManagerMock.Object,
                _optionsMonitorMock.Object
            );
        }

        [Test]
        public void SendBatteryInfoToClient_ShouldCallBroadcastWithCorrectDto()
        {
            // Arrange
            var batteryPercentage = new BatteryPercentage
            {
                BatteryPercentageLevel = 42
            };

            // Act
            _notifier.SendBatteryInfoToClient(batteryPercentage);

            // Assert
            _connManagerMock.Verify(cm =>
                    cm.BroadcastToTopic(
                        "battery-topic",
                        It.Is<BatteryLevelDto>(dto =>
                            dto.BatteryLevel == 42 &&
                            dto.eventType   == nameof(BatteryLevelDto) &&
                             
                            !string.IsNullOrWhiteSpace(dto.requestId)
                        )
                    ),
                Times.Once
            );
        }
    }
}