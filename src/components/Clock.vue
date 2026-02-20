<template>
  <div class="clock" id="clock">
    <div id="days">
      <div
        v-for="day in daysList"
        :key="day"
        :class="{ active: day === currentDay }"
        :style="day === currentDay ? activeDayStyle : ''"
      >
        {{ day }}
      </div>
    </div>

    <div id="time">
      <div>
        <span id="hours">{{ time.hours }}</span>
        <span>Hours</span>
      </div>
      <div><span class="dots">:</span></div>
      <div>
        <span id="minutes">{{ time.minutes }}</span>
        <span>Minutes</span>
      </div>
      <div><span class="dots">:</span></div>
      <div>
        <span id="seconds">{{ time.seconds }}</span>
        <span>Seconds</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useTime } from "@/composables/useTime";

const daysList = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const { time, currentDay } = useTime();

const activeDayStyle =
  "font-size: 23px; font-weight: bold; -webkit-box-reflect: below -25px linear-gradient(transparent, #0003);";
</script>

<style scoped>
.clock {
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  margin: 0;
  width: unset;
  opacity: 1;
  transition: all 0.4s linear;
}

#clock #time {
  display: flex;
}

#clock #time div {
  position: relative;
  margin: 0 0.5em;
  height: 75%;
  -webkit-box-reflect: below 1px linear-gradient(transparent, #0004);
}

#clock #time div span {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 140px;
  height: 75%;
  color: #ffffff;
  font-weight: 500;
  font-size: 5em;
  font-variant-numeric: tabular-nums;
  font-family: "Orbitron", sans-serif; /* Unify with theme */
}

#clock #time div .dots {
  min-width: unset;
}

#clock #time div span:nth-child(2) {
  z-index: 9;
  height: 16px;
  border-radius: 0;
  box-shadow: none;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-weight: 700;
  font-size: 0.8em;
}

#days {
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: flex-start;
  color: #ffffff;
  text-transform: uppercase;
}

#days div {
  padding: 7px;
  font-size: 13px;
  -webkit-box-reflect: below -19px linear-gradient(transparent, #0003);
  transition: all 0.3s;
}
</style>
