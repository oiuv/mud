#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "金莲阁");
        set("long", @LONG
这金莲阁位於终南山山腰间，形势颇为险要。金莲阁後有
一口碗口粗的涌泉，泉水碧绿透明，香甜诱人，在当地颇为有
名，不少人特别来此，只为了取这ㄦ的水来泡茶。那寺前的一
块石碑(shibei)，刻了一收首王维的诗。往南看去是一条山路。
往西走是一条蜿蜒的山路。
LONG
        );

        set("item_desc", ([
                "shibei"  : HIY
"

                欲 分 白 太
                投 野 云 乙
                何 中 回 近  终
                处 峰 望 天  南
                宿 变 合 都  山
                ， ， ， ，
                隔 阴 青 连
                水 晴 霭 山  王
                问 众 入 到  维
                樵 壑 看 海
                夫 殊 无 隅
                。 ； 。 ；

" NOR, 
        ]));

        set("outdoors", "quanzhen");
        set("exits", ([
                "westup"     : __DIR__"shanlu10",
                "southdown"  : __DIR__"shanlu11",
        ]));

        setup();
        replace_program(ROOM);
}
