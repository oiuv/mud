//Room: qunyulou1.c

inherit ROOM;

void create()
{
        set("short", "群玉楼大厅");
        set("long", @LONG
群玉楼大厅。三面都糊着纱窗，窗棂纵横交错，分成大小格式的花
纹，每一格都有一方小玻璃镶嵌着，显得甚为雅致，玻璃内灯光流映生
辉，案头所供养的梅花，疏影横斜，也贴在玻璃窗上。炫目的朝阳从琉
璃窗格透入，微风轻拂，缕缕幽香，沁人心脾。
LONG);
        set("exits", ([ /* sizeof() == 2 */
        	"north" : __DIR__"qunyulou",
        	"up"   : __DIR__"qunyulou2",
        ]));
        set("objects", ([
        	__DIR__"npc/lingfeixue" : 1,
        ]) );

	setup();
        replace_program(ROOM);
}
