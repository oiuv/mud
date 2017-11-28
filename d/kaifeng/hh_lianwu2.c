inherit ROOM;

void create()
{
        set("short", "练武场");
        set("long", @LONG
空阔的场地上铺满了细细的黄土，正好适合演武。四面有
几个红花会的弟子正在练武。练武场的中心竖着几根木桩，木
桩周围还挖了若干个大沙坑。南面通往总舵的大门所在，戒备
甚是森严。练武场的北边则可穿往大厅。
LONG);
        set("no_clean_up", 0);
        set("exits", ([
  		"east" : __DIR__"hh_lianwu1",
	]));
        set("objects", ([
                CLASS_D("honghua") + "/chang1" : 1,
                __DIR__"npc/honghua2" : 2,
        ]));
        set("outdoors", "honghua");
        setup();
        replace_program(ROOM);
}
