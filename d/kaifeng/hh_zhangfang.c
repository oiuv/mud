inherit ROOM;

void create()
{
        set("short", "账房");
        set("long", @LONG
这里就是红花会总舵内的账房，地方不大但是很清静，除
了账房先生天天在这里统计管理会中的帐务外，平时很少有其
他的人光顾这里，房间里“噼噼啪啪”的珠算声不绝于耳，让
人听听也觉得烦。
LONG);
        set("no_clean_up", 0);
        set("exits", ([
  		"east" : __DIR__"hh_hguangchang",
	]));
        setup();
        replace_program(ROOM);
}
