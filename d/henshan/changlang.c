inherit ROOM;

void create()
{
          set("short","长廊");
          set("long",@LONG
这是通往客房的长廊,不远处便是客房和厨房了。
LONG);
          set("exits",([
            	  "west"      :__DIR__"zhurongdian",
                  "northeast" :__DIR__"henshan_chufang",
	          "north"     :__DIR__"kefang",
          ]));

          set("objects", ([
                  __DIR__"npc/xiangke" : 2,
          ]));
          setup();
          replace_program(ROOM);
}