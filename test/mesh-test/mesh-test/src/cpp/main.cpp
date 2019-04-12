volatile int test = 0;
int main()
{
    test = 10;
    while(1)
    {
        test = 19;
    }
    test = 15;
}
