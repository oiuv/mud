inherit ROOM;
#include <ansi.h> 

void create()
{
        set("short", "分天渊侧");
        set("long", @LONG
过了分天崖，回头望望，白云寥寥，云气弥漫，想想还有点
后怕，但毕竟过来了。往前看，就是凌霄城了，这座武林中传说
的名城，终于出现在你面前了，赶快进去看看吧。  
LONG);
        set("outdoors", "lingxiao");
        set("exits", ([
            	"north" : __DIR__"shanya",
            	"south" : __DIR__"bingqiao",
        ]));
        setup();
        replace_program(ROOM);
}


