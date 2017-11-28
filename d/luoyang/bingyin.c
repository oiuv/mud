inherit ROOM;

void create()
{
	set("short", "兵营");
	set("long", @LONG
这里是兵营，密密麻麻到处都是官兵，有的在武将的指挥下列队操练，
有的独自在练功，有的坐着、躺着正在休息。南墙下坐着主帅，不动声色
地寻视着四周。看到你进来，他们全都向你包围了过来，形势看来不太妙。
北边有一个兵器库。
LONG);
	set("no_clean_up", 0);
	set("exits", ([
  		"north" : __DIR__"bingqiku",
  		"south" : __DIR__"bingyindamen",
	]));
        set("objects", ([
                "/d/kaifeng/npc/guanbing" : 4,
                "/d/city/npc/wujiang" : 1,
        ]));
	setup();
	replace_program(ROOM);
}
