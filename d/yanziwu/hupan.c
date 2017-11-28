#include <ansi.h>
inherit RIVER;

void create()
{
         set("short", "太湖湖畔");
         set("long", @LONG
太湖处江浙之间。她襟带三江，东南之水尽汇于此，周行
五百里，古称五湖。矗立湖 (river)岸，唯见长天远波，放眼
皆碧，七十二峰苍翠挺立在三万六千顷波涛之中，使人心襟大
开直欲仰天长啸，方能表此喜乐。
LONG);
        set("arrive_room", "/d/yanziwu/bozhou");
        set("exits", ([
                "northeast" : "/d/suzhou/road5",
        ]));
        set("objects", ([  
                __DIR__"npc/yufu" : 1,
        ]));  

        set("resource/fish", ({ "/clone/fish/liyu",
                                "/clone/fish/jiyu",
                                "/clone/fish/qingyu",
                                "/clone/fish/caoyu", }));

        set("outdoors", "yanziwu");
        setup();
        replace_program(RIVER);
}
