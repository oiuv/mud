inherit ROOM;

void create()
{
        set("short", "禹王台");
        set("long", @LONG
禹王台建造于小山丘之上，这里风景优美，环境幽雅，自
古以来就是人们游春登高的胜地。相传春秋时期，晋国盲人乐
师旷常在此吹奏古乐，故名『吹台』。
LONG);
        set("objects", ([
  		__DIR__"npc/woman" : 1,
	]));
        set("no_clean_up", 0);
        set("exits", ([
  		"west" : __DIR__"shulin",
  		"eastup" : __DIR__"yuwangmiao",
	]));
        set("outdoors", "kaifeng");

        setup();
        replace_program(ROOM);
}
