inherit ROOM;

void create()
{
	set("short", "武器店");
	set("long", @LONG
这家武器店和街对面的盔甲店都是同一个老板开的，之所以把它们分
开，只是为了方便顾客购买自己需要的东西，店内四壁上挂满了各式个样
的兵器，金制的，银制的，铜制的，铁制的，皮制的，品种齐全，应有尽
有。
LONG);
        set("no_fight", 1);
	set("no_clean_up", 0);
	set("exits", ([
  		"north" : __DIR__"eroad1",
	]));
        set("objects", ([
                __DIR__"npc/zhu2" : 1,
        ]));
	setup();
	replace_program(ROOM);
}
