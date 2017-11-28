// /guanwai/bingmian.c

inherit ROOM;

void create()
{
	set("short", "冰面");
	set("long", @LONG
这里是松花江的江面，现已冻成了几尺厚的坚冰。行人或马匹，车辆均
可横逾江面而绝无危险。冰面上留有厚厚的积雪，与两岸连成一片，只有中
间经常行走之出，露出一条青色的冰路。
LONG );
	set("exits", ([
		"east"  : __DIR__"damenkan",
		"west"  : __DIR__"chuanchang",
	]));
	set("outdoors", "guanwai");
	setup();
}

int valid_leave(object me, string dir)
{
	object obj;
        int i;

	switch (NATURE_D->query_month())
        {
        case 11: case 12: case 1: case 2: case 3: case 4:
		message_vision("$N踩在冰面上赶路，脚下吱嘎吱嘎的响。\n\n", me);
		if (random(me->query_dex()) + me->query_dex() / 2 < 20)
		{
			me->receive_wound("qi", 20);
			me->receive_damage("qi", 10);
		        message_vision("$N只觉得脚下一滑，全身腾空而起，结结实实的摔在了冰面上！\n", me);
		}
		break;
        default:
                me->set_temp("die_reason", "因为冰面开冻，掉到江里面淹死了");
                me->die();
                write("以后可要注意啦！\n");
                return -1;
	}
	return 1;
}
