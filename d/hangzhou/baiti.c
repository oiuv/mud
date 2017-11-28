#include <room.h>
inherit ROOM;

void create()
{
        set("short", "白堤");
        set("long", @LONG
白堤横旦湖上，把西湖分成里湖与外湖。堤上种满了杨柳，碧桃。
每逢春至，“翩翩柳丝泛绿，树树桃颜带笑”。白居易曾有“乱花渐
欲迷人眼，浅草才能没马蹄。最爱湖东行不足，绿杨荫里白沙堤。”
来描述这里的景色。朝西南走过了锦带桥便是“平湖秋月”。东边则
是断桥。
LONG);
        set("exits", ([
            "southwest" : __DIR__"pinghuqiuyue",
            "north"      : __DIR__"duanqiao",
        ]));
        set("outdoors", "hangzhou");
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
