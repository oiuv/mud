inherit ROOM;

void create()
{
        set("short", "素斋厅");
        set("long", @LONG
这是寺庙中的大小僧人用餐的地方，当然方丈的素斋是专
门有人送过去的，平时相国寺的僧人听钟吃饭，等他们吃完了
也经常把剩下的素斋舍给穷人吃。逢塑望，十五也经常作些斋
席请大施主，高官富贵们品尝，所以素斋厨的僧人是最忙的。
LONG
        );
        set("exits", ([
  		"north" : __DIR__"chufang2",
  		"west" : __DIR__"zhongyuan",
	]));

        set("no_clean_up", 0);
        set("objects", ([
  		__DIR__"npc/liucaizhu" : 1,
  		__DIR__"npc/kong" : 1,
	]));

        setup();
        replace_program(ROOM);
}
