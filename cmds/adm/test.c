#include <ansi.h>
inherit F_CLEAN_UP;

void print_r(mixed *arr);
void debug(string);
int help();

void create() { seteuid(getuid()); }

int main(object me, string arg)
{
    mixed *args;

    if (!arg || !wizardp(me))
        return notify_fail("debug what???\n");
    /**
     * debug code here
     */
    args = explode(arg, " ");
    switch (args[0])
    {
    case "NPC":
        debug(NPC_D->check_level(me));
        debug(NPC_D->get_exp(me));
        break;
    case "SK":
        // NPC_D->init_npc_skill(me, NPC_D->get_exp(me));
        NPC_D->init_npc_skill(me, 20);
        break;
    case "X":
        printf("%f\n", to_int(pow(to_float(4200000 * 10), 1.0 / 3)) * 0.75);
        break;
    default:
        debug(arg);
    }

    return 1;
}

int help()
{
    write(origin() + "\n");
    return 1;
}

// Êý×é´òÓ¡ debug
varargs void print_r(mixed *arr, int step)
{
    int i, j;
    if (sizeof(arr))
    {
        write(YEL "({\n" NOR);

        for (i = 0; i < sizeof(arr); i++)
        {
            if (arrayp(arr[i]))
            {
                step++;
                for (j = 0; j < step; j++)
                {
                    write("    ");
                }
                write(i + " => ");
                print_r(arr[i], step);
                step--;
            }
            else
            {
                for (j = 0; j <= step; j++)
                {
                    write("    ");
                }
                write(i + " => " + arr[i] + "\n");
            }
        }

        for (j = 0; j < step; j++)
        {
            write("    ");
        }
        write(YEL "})\n" NOR);
    }
    else
    {
        write(YEL "({ })\n" NOR);
    }
}

void debug(string str)
{
    write(BRED "Debug:" + str + "\n" NOR);
}
