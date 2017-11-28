inherit ROOM;

void create()
{
      set("short", "休息室");
      set("long", @LONG
这里是峨嵋华藏庵的休息室。窗帘拉下来，房里整整齐齐
放了很多木床。有几个夜晚守庵的小师太正在睡觉。休息室外
就是禅房。
LONG);
      set("exits", ([
          "north" : __DIR__"hcachanfang", 
      ]));
      set("no_fight", 1);
      set("sleep_room", 1);
      set("no_clean_up", 0);
      setup();
      replace_program(ROOM);
}
