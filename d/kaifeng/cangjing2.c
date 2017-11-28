inherit ROOM;

void create()
{
        set("short", "藏经楼二层");
        set("long", @LONG
小楼的四个角落中放着石灰包，用来吸收空气中的水份隔
段时间，寺庙中的和尚会把收藏在盒中的佛经放到外面去晒以
防日久被虫子蛀了，用来晾晒佛经的石头就称为晒经石，据说
有佛力。
LONG);
        set("objects", ([
  		__DIR__"npc/obj/jing4" : 1,
  		__DIR__"npc/obj/jing3" : 1,
  		__DIR__"npc/obj/jing2" : 1,
  		__DIR__"npc/obj/jing1" : 1,
	]));

        set("no_clean_up", 0);
        set("exits", ([
  		"down" : __DIR__"cangjing",
	]));

        setup();
        replace_program(ROOM);
}
