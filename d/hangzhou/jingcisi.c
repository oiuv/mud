#include <room.h>
inherit ROOM;

void create()
{
        set("short", "净慈寺");
        set("long", @LONG
净慈寺，原名慧日永明院，又叫兴教寺。净慈寺面向西湖，後拥
苍然挺秀的南屏山。往西就回到大道上。
LONG);
        set("exits", ([
            	"west"   : __DIR__"road15",
            	"enter"   : __DIR__"jingci",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
