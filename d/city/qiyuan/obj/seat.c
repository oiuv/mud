//seat

#include  <ansi.h>

inherit  ITEM;

void  create()
{
                set_name("石凳",  ({  "stool"  }));
                set_weight(20000);
        set("long",  "这是张大理石制的凳子。\n"  );
                if(  clonep()  )
                                set_default_object(__FILE__);
                else  {
                                set("unit",  "张");
                                set("material",  "stone");
                set("value",  2000);
                                set("no_get",  1);
                set("amount",30);
                }
                setup();
}
