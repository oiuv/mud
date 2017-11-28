inherit ROOM;
#include <ansi.h>

void create()
{
        set("short", "玄岳门");
        set("long", @LONG
你的面前是一座林木繁茂的高山，几座山峰在云雾中隐约
可见，一条石阶向山上延伸，走着几个进香客。一个四柱三间
五楼式的石坊跨山而建，正面镌有「治世玄岳」四个大字，原
来这就是天下闻名的武当山。武当山一名太和山，为七十二福
地之一，有二十七峰、三十六岩、二十四涧、五台、五井、三
潭、三天门、三洞天和一福地，百里内密树森罗，蔽日参天景
物幽绝。
LONG);
        set("objects", ([
                CLASS_D("wudang") + "/zhike": 1,
                CLASS_D("wudang") + "/daotong": 2,
        ]));
        set("outdoors", "wudang");
        set("exits", ([
                "east"     : __DIR__"slxl3",
                "southup"  : __DIR__"shijie1",
        ]));
        setup();
}
