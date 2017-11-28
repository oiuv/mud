#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", HIW "\n\n                天        极        道" NOR);
        set("long", HIW "\n"
"茫茫云海，渺无边际。四周金光散布，祥云朵朵，远处有凤凰\n"
"盘绕，麒麟逐戏。耳边传来阵阵梵音，令你茫然不知所措。天\n"
"道众生遍及欲界、色界及无色界三界。欲界有六欲天，色界有\n"
"四禅十八天，无色界四天，共有二十八天。\n\n" NOR);
        setup();
}
