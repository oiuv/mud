inherit ROOM;

void create()
{
          set("short","长廊");
          set("long",@LONG
这是通往客房的长廊,不远处便是客房和厨房了。
LONG);
          set("exits",([
            	  "west"     :__DIR__"chanyuan",
                  "south"    :__DIR__"songshan_chufang",
	          "east"     :__DIR__"kefang",
          ]));
          setup();
          replace_program(ROOM);
}