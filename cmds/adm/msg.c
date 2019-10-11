
inherit F_CLEAN_UP;
#include <ansi.h>

int main(object me, string arg)
{
      if (! wizardp(me) || wiz_level(me) < 5)
               return 0;

      if (! arg)
               return 0;

      message_system(HIW + arg + "\n" NOR);

      return 1;

}