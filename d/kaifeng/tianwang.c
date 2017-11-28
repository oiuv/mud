inherit ROOM;

void create()
{
        set("short", "天王殿");
        set("long", @LONG
这是天王殿，四大天王手握法器，高据于法坛之上，两边
有红色栅栏与中间的通道隔开。每个法像的身前各有一个蒲团
供善男信女们膜拜，以求风调雨顺。
LONG);
        set("objects", ([
  		__DIR__"npc/hufa" : 1,
	]));
        set("no_clean_up", 0);
        set("exits", ([
  		"south" : __DIR__"qianyuan",
  		"north" : __DIR__"zhongyuan",
	]));

        setup();
        replace_program(ROOM);
}
