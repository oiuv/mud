#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "白虎堂");
        set("long", @LONG
这是日月神教下第二大堂白虎堂的大厅所在，大厅内非常
的宽畅明亮。几名日月弟子站立厅中，举目望去，一派肃然的
景象。堂梁上有一块旧木匾(bian)。
LONG);
        set("exits", ([
            	"west" : __DIR__"baistep1",
            	"east" : __DIR__"baigate",
        ]));
        set("item_desc", ([
                "bian" : WHT "\n\n        ※※※※※※※※※※※※※※\n"
                              "        ※                        ※\n"
                              "        ※   " HIW "长河落日  白虎在天" NOR + WHT "   ※\n"
                              "        ※                        ※\n"
                              "        ※   " HIW "千秋万载  一统江湖" NOR + WHT "   ※\n"
                              "        ※                        ※\n"
                              "        ※※※※※※※※※※※※※※\n\n\n" NOR,
        ]) );
        set("objects",([
                __DIR__"npc/dizi4" : 4,
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
