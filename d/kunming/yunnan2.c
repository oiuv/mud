inherit ROOM;

void create()
{
        set("short", "原始森林");
        set("long", @LONG
你走进原始森林，只见周围迷迷茫茫全是参天大树，遮天
蔽日，四周光线很暗，分不清东南西北，任是谁进来都别想再
出去了。幸好当年诸葛亮入滇时曾开出了一条路。否则，就算
不被猛兽吃掉，恐怕也要被毒瘴毒死。
LONG);
        set("outdoors", "kunming");

        set("exits", ([
                "west" : __DIR__"yunnan3", 
                "north"  :__DIR__"yunnan1",
        ]));
        set("objects", ([
                "/clone/worm/huabanzhu" : 1,
        ]));
        setup();
        replace_program(ROOM);
}

