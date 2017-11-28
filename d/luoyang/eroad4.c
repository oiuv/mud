inherit ROOM;

void create()
{
	set("short", "永徽道");
	set("long", @LONG
站在永徽大街上，你会发现这条街有快慢道之分，街道两旁栽植松柏，
到处是张灯结彩。大街两旁排列着许多店铺。临街店铺里经营着汴绣、字
画、陶瓷、古董、名酒、小吃等，热闹非凡。北边是庙会所在，非常的热
闹，人山人海，人声鼎沸，在里面可以找到你所想要的东西，南边是一家
胭脂店，有不少年轻女子前来光顾。
LONG);
        set("outdoors", "luoyang");
        set("no_clean_up", 0);
        set("exits", ([
  		"east" : __DIR__"eroad5",
  		"north" : __DIR__"miaohui",
  		"south" : __DIR__"jinyin",
  		"west" : __DIR__"eroad3",
	]));
        set("objects", ([
                "/d/beijing/npc/girl1" : 1,
                "/d/beijing/npc/xiaofan" : 1,
        ]));
	setup();
	replace_program(ROOM);
}
