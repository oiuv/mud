//ROOM: /d/yanziwu/qinfang1.c

inherit ROOM;

void create()
{
        set("short", "沁芳阁");
        set("long",@LONG
这里是供慕容世家的仆人小憩的地方，三面临水。微风拂
过，送来缕缕的荷花叶香，沁人心脾，沁芳阁因此而名。一架
墨绿色的竹梯通向楼上的休息室。
LONG );
        set("exits", ([
            "east"  : __DIR__"yimen",
            "up"    : __DIR__"qinfang2",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
