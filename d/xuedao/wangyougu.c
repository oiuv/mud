inherit ROOM;

void create()
{
        set("short", "忘忧谷");
        set("long", @LONG
这里乃是大轮寺外一处僻静所在，四下绝无人迹。前前後
後，大大小小几百座佛塔，被白得耀眼的雪被披盖着。银白色
的山野、雪地里闪耀着红色和蓝色的光带，五彩缤纷，迷宫样
的琼楼仙阁在你眼前出现。南面一条小径不知通往何处。
LONG);
        set("exits", ([
                "westup" : __DIR__"sroad8",
                "eastup" : __DIR__"sroad9",
        ]));
        set("objects", ([
                __DIR__"npc/zhuoma" :1,
                __DIR__"npc/yangzong" :1,
                CLASS_D("xuedao") + "/shanyong" : 1,
        ]));
        set("outdoors", "xuedao");
        setup();
        replace_program(ROOM);
}

