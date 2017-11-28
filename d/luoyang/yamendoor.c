inherit ROOM;

void create()
{
	set("short", "衙门");
	set("long", @LONG
这里是衙门大门，两扇朱木大门紧紧关闭着。“肃静”“回避”的牌
子分放两头石狮子的旁边。前面有一个大鼓，显然是供小民鸣冤用的。几
名衙役在门前巡逻。
LONG);
        set("outdoors", "luoyang");
        set("no_clean_up", 0);
        set("exits", ([
  		"east" : __DIR__"yamen",
  		"west" : __DIR__"nroad2",
	]));
        set("objects", ([
                "/d/zhongzhou/npc/yayi" : 4,
        ]));
	setup();
	replace_program(ROOM);
}
