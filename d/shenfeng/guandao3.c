inherit ROOM;

void create()
{
	set("short", "破旧长城");
	set("long", @LONG
昔日雄伟的长城已面目全非，岁月和战争已几乎把它夷为
平地。唯一仅存的一点废墟，都被历代英雄的鲜血染成暗红色。
这里虽然是一片萧杀，却有几株小树从碎石的缝隙中挤出，给
人以一线生机的感觉。
LONG);
        set("outdoors", "shenfeng");
	set("exits", ([
  		"west" : __DIR__"guandao4",
  		"east" : __DIR__"guandao2",
	]));

	setup();
	replace_program(ROOM);
}
