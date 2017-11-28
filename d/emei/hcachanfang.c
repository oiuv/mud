inherit ROOM;

void create()
{
      set("short", "禅房");
      set("long", @LONG
这里便是峨嵋华藏庵的禅房。地下散乱地放着许多蒲团木
鱼等，此处正是本派弟子打坐修行之所。几位年轻师太和俗家
女弟子正肃容入定。禅房后面有一道门通往华藏庵休息室，北
边的走廊通向广场。
LONG);
      set("exits", ([
          "north" : __DIR__"hcawest2", 
          "south" : __DIR__"hcaxiuxishi", 
      ]));
      set("sleep_room", 1);
      set("no_fight", 1);
      set("no_clean_up", 0);
      setup();
      replace_program(ROOM);
}
