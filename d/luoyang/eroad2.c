inherit ROOM;

void create()
{
	set("short", "永徽道");
	set("long", @LONG
站在永徽大街上，你会发现这条街有快慢道之分，街道两旁栽植松柏，
到处是张灯结彩。大街两旁排列着许多店铺。临街店铺里经营着汴绣、字
画、陶瓷、古董、名酒、小吃等，热闹非凡。北边是一所私塾，南边是替
人缔结婚约和解除婚约的地方，叫一线牵。
LONG);
        set("outdoors", "luoyang");
        set("no_clean_up", 0);
        set("exits", ([
  		"east" : __DIR__"eroad3",
  		"north" : __DIR__"sishu",
  		"south" : __DIR__"yuelao",
  		"west" : __DIR__"eroad1",
	]));
        set("objects", ([
                "/d/beijing/npc/boy1" : 1,
                "/d/beijing/npc/old2" : 1,
        ]));
	setup();
	replace_program(ROOM);
}
