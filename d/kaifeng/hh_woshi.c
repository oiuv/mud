inherit ROOM;

void create()
{
        set("short", "总舵主卧室");
        set("long", @LONG
这里是红花会总舵主的静修之所，迎门一幅山水画清秀脱
俗，定是名家手笔，画上有一块大匾。小几上的一对羊脂玉瓶
里插的满满的都是晶莹剔透的白菊，不知哪里放了个香炉，吐
着一缕似有似无的暗香，醉人心脾。
LONG);
        set("no_clean_up", 0);
        set("exits", ([
  		"south" : __DIR__"hh_xiaojing2",
	]));
        set("objects", ([
                CLASS_D("honghua") + "/chen" : 1,
                __DIR__"npc/xinyan" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
