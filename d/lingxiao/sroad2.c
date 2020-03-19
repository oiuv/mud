inherit ROOM;

void create()
{
        set("short", "山路");
        set("long", @LONG
这时雪更大些了，使得地上盖上了厚厚的一层。正值朝阳初
出，从山顶倒挂下来的冰川，由于太阳光的折射和发射，整个冰
层都变成浅蓝色的透明体，那些末曾凝结的雪花，在阳光底下，
泛出霞辉丽彩，奇妙得难以形容。山路也渐渐不平坦起来，走一
步跌三步，联想到古诗所说：“去时雪满天山路”，也不过如此
吧。
LONG);
        set("outdoors", "lingxiao");
        set("exits", ([
            	"southdown"  : __DIR__"sroad1",
            	"northup"  : __DIR__"sroad3",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}

